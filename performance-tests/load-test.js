import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const taxaErros = new Rate('taxa_erros');
const latenciaP95 = new Trend('latencia_p95', true);

// Endpoint alvo — ajuste conforme o ambiente
const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:3000';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp-up
    { duration: '1m',  target: 50 },  // carga sustentada
    { duration: '30s', target: 0  },  // ramp-down
  ],
  thresholds: {
    // 95% das requisições abaixo de 200ms
    http_req_duration: ['p(95)<200'],
    // taxa de erro abaixo de 1%
    taxa_erros: ['rate<0.01'],
  },
};

export default function () {
  const resposta = http.get(`${BASE_URL}/api/v1/players`, {
    tags: { endpoint: 'players_listAll' },
  });

  const sucesso = check(resposta, {
    'status 200': (r) => r.status === 200,
    'body não vazia': (r) => r.body && r.body.length > 0,
    'latência < 200ms': (r) => r.timings.duration < 200,
  });

  taxaErros.add(!sucesso);
  latenciaP95.add(resposta.timings.duration);

  sleep(1);
}

export function handleSummary(data) {
  const dur = data.metrics.http_req_duration;
  const rps = data.metrics.http_reqs;

  return {
    stdout: `
╔══════════════════════════════════════════════════════╗
║         TalentFC — Relatório de Performance          ║
╠══════════════════════════════════════════════════════╣
║  Requisições totais : ${String(rps?.values?.count ?? 0).padEnd(28)}║
║  Throughput (req/s) : ${String((rps?.values?.rate ?? 0).toFixed(2)).padEnd(28)}║
║  Latência  p50      : ${String((dur?.values?.['p(50)'] ?? 0).toFixed(2) + ' ms').padEnd(28)}║
║  Latência  p95      : ${String((dur?.values?.['p(95)'] ?? 0).toFixed(2) + ' ms').padEnd(28)}║
║  Latência  p99      : ${String((dur?.values?.['p(99)'] ?? 0).toFixed(2) + ' ms').padEnd(28)}║
║  Taxa de erros      : ${String(((data.metrics.taxa_erros?.values?.rate ?? 0) * 100).toFixed(2) + ' %').padEnd(28)}║
╚══════════════════════════════════════════════════════╝
`,
  };
}

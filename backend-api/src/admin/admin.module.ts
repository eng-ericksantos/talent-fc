import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [HttpModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

import { Module } from '@nestjs/common';
import { MealController } from '../meal/meal.controller';
import { MealService } from '../meal/meal.service';

@Module({
  controllers: [MealController],
  providers: [MealService],
})
export class RoutesMealModule {}

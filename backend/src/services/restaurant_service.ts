import { prisma } from "../lib/prisma";

export const getRestaurants = async () => {
  return prisma.restaurant.findMany({
    include: {
      categories: true,
      promotions: true,
    },
  });
};

export const getRestaurantById = async (id: number) => {
  return prisma.restaurant.findUnique({
    where: { restaurant_id: id },
    include: {
      categories: true,
      promotions: true,
      bookings: true,
    },
  });
};

export const createRestaurant = async (data: any) => {
  return prisma.restaurant.create({
    data,
  });
};

export const updateRestaurant = async (
  id: number,
  data: any
) => {
  return prisma.restaurant.update({
    where: { restaurant_id: id },
    data,
  });
};

export const deleteRestaurant = async (id: number) => {
  return prisma.restaurant.delete({
    where: { restaurant_id: id },
  });
};
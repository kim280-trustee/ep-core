import { z } from "zod";

export const createRequiredString = (
  message = "This field is required",
) =>
  z.string().min(1, message);

export const createRequiredNumber = (
  message = "This field is required",
) =>
  z.number({
    message,
  });
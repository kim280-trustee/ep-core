import { returnService } from "../services/return.service";

export const useReturns = () => {
  return {
    createReturn: returnService.createReturn.bind(returnService),
    getReturns: returnService.getReturns.bind(returnService),
    getReturnById: returnService.getReturnById.bind(returnService),
    getReturnsBySaleId:
      returnService.getReturnsBySaleId.bind(returnService),
  };
};
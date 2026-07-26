import {
  seedService,
} from "./seed.service";


export function runSeed() {

  seedService.seed();

}
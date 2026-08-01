/**
 * ============================================================
 * useStorage Hook
 * ============================================================
 */

import {
  storageService,
} from "../services/storage.service";


import type {
  StorageFile,
} from "../types/storage.types";


type UploadFileInput =
  Omit<
    StorageFile,
    "id" |
    "createdAt"
  >;



export function useStorage() {


  function upload(
    file: UploadFileInput,
  ) {

    return storageService.upload(
      file,
    );

  }



  function getFile(
    id: string,
  ) {

    return storageService.getFile(
      id,
    );

  }



  function getFiles() {

    return storageService.getFiles();

  }



  function remove(
    id: string,
  ) {

    return storageService.delete(
      id,
    );

  }



  return {

    upload,

    getFile,

    getFiles,

    remove,

  };

}
/**
 * ============================================================
 * E&P Technologies
 * EP Core
 * Storage Service
 * ============================================================
 */

import type {
  StorageFile,
} from "../types/storage.types";


class StorageService {


  private files:
    StorageFile[] = [];



  upload(
    file: Omit<
      StorageFile,
      "id" |
      "createdAt"
    >,
  ) {


    const uploadedFile:
      StorageFile =
    {

      ...file,

      id:
        crypto.randomUUID(),

      createdAt:
        new Date(),

    };


    this.files.push(
      uploadedFile,
    );


    return uploadedFile;

  }



  getFile(
    id: string,
  ) {


    return this.files.find(
      (file) =>
        file.id === id,
    );

  }



  getFiles() {

    return this.files;

  }



  delete(
    id: string,
  ) {


    const index =
      this.files.findIndex(
        (file) =>
          file.id === id,
      );


    if (
      index === -1
    ) {

      return false;

    }


    this.files.splice(
      index,
      1,
    );


    return true;

  }



  clear() {

    this.files = [];

  }


}


export const storageService =
  new StorageService();
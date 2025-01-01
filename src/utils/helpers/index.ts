import * as crypto from "crypto";

class Helpers {
  public getPaginationData(limit: number, page: number, totalCount: number) {
    const currentPage = page;
    const totalPages = totalCount == 0 ? 1 : Math.ceil(totalCount / limit);
    const previousPage = page - 1 === 0 ? null : page - 1;
    const nextPage = page + 1 > totalPages ? null : page + 1;
    return { currentPage, totalPages, previousPage, nextPage };
  }

  public generateSlug(name: string): string {
    const slug = name.replace(/([^\w ]|_)/g, "");
    return `${slug.replace(/\s+/g, "-").toLowerCase()}`;
  }

  public generateRandomPassword(): string {
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseChars = lowercaseChars.toUpperCase();
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()-_+={}[];':\"\\|,.<>/?";

    // Combine all character pools:
    const allChars = lowercaseChars + uppercaseChars + numbers + symbols;

    // Generate random characters using crypto.randomFillSync:
    const passwordBuffer = new Uint8Array(10);
    crypto.randomFillSync(passwordBuffer);

    // Convert bytes to password characters:
    let password = "";
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(
        (passwordBuffer[i] / 256) * allChars.length
      );
      password += allChars[randomIndex];
    }

    return password;
  }
}

export default new Helpers();

import { Page } from '@playwright/test';

export class BasePage {
  
  constructor(protected page: Page) {}

  public goto = (adress: string) => this.page.goto(adress);
}
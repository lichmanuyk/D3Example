import { Injectable } from "@angular/core";

import { ElementConfig } from "./model/index";

@Injectable({
  providedIn: "root"
})
export class ElementConfigService {
  config: ElementConfig;

  private openHoleConfig: ElementConfig = {
    type: 9,
    holeSize: 16,
    holeMD: 590
  };

  private productionCasingConfig: ElementConfig = {
    type: 6,
    holeSize: 17,
    holeMD: 1900,
    od: 13.375,
    startMD: 0,
    endMD: 1500,
    tocMD: 553
  };

  constructor() {
    this.config = this.productionCasingConfig;
  }
}

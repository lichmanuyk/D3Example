import { TestBed } from '@angular/core/testing';

import { ElementConfigService } from './element-config.service';

describe('ElementConfigService', () => {
  let service: ElementConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElementConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

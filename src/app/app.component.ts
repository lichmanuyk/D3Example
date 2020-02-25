import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges
} from "@angular/core";
import * as d3 from "d3";

import { Point, ElementConfig } from "./model/index";
import { ElementConfigService } from "./element-config.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnChanges, AfterViewInit {
  @ViewChild("sketch") private sketchContainer: ElementRef;

  margin = { top: 20, right: 20, bottom: 20, left: 20 };
  config: ElementConfig;

  constructor(private configService: ElementConfigService) {
    this.config = this.configService.config;
  }

  ngAfterViewInit() {
    if (this.config) {
      this.createSketch();
    }
  }

  ngOnChanges() {
    if (this.config) {
      this.createSketch();
    }
  }

  onResize() {
    this.createSketch();
  }

  private createSketch() {
    d3.select("svg").remove();

    const element = this.sketchContainer.nativeElement;

    const svg = d3
      .select(element)
      .append("svg")
      .attr("width", element.offsetWidth)
      .attr("height", element.offsetHeight);

    const contentGroup = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

    const contentWidth =
      element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight =
      element.offsetHeight - this.margin.top - this.margin.bottom;

    const { maxHoleSize, minMD, maxMD, prevMD } = this.calculateRanges(
      this.config
    );

    const xScale = d3
      .scaleLinear()
      .domain([0, maxHoleSize])
      .range([0, contentWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([minMD, maxMD])
      .range([0, contentHeight]);

    // HOLE DRAWING
    const holePoints = this.calculateHolePoints(
      xScale,
      yScale,
      this.config,
      maxHoleSize,
      prevMD
    );
    this.drawHole(contentGroup, holePoints);

    // CEMENT DRAWING
    const cementPoints = this.calculateCementPoints(
      xScale,
      yScale,
      this.config,
      maxHoleSize
    );
    this.drawCement(contentGroup, holePoints);

    // CASING DRAWING
    const casingPoints = this.calculateCasingPoints(
      xScale,
      yScale,
      this.config,
      maxHoleSize
    );
    this.drawCasing(contentGroup, casingPoints);
  }

  private drawCement(contentGroup, cementPoints: Point[]): void {
    const lineGenerator = d3
      .line<Point>()
      .x(point => point.x)
      .y(point => point.y);

    const holeContour = contentGroup
      .append("path")
      .attr("d", lineGenerator(cementPoints))
      .attr("stroke", "#a0acbc")
      .attr("stroke-width", 2)
      .attr("fill", "#a0acbc");
  }

  private calculateCementPoints(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    config: ElementConfig,
    maxHoleSize: number
  ): Point[] {
    const leftX = xScale((maxHoleSize - config.holeSize) / 2);
    const topY = yScale(config.tocMD);
    const bottomY = yScale(config.holeMD);
    const rightX = xScale(config.holeSize) + leftX;

    const points = [
      { x: leftX, y: topY },
      { x: leftX, y: bottomY },
      { x: rightX, y: bottomY },
      { x: rightX, y: topY }
    ];

    return points;
  }

  private drawCasing(contentGroup, casingPoints: Point[][]): void {
    const lineGenerator = d3
      .line<Point>()
      .x(point => point.x)
      .y(point => point.y);

    casingPoints.forEach(points => {
      const partOfCasing = contentGroup
        .append("path")
        .attr("d", lineGenerator(points))
        .attr("stroke", "#303946")
        .attr("stroke-width", 2)
        .attr("fill", "#303946");
    });
  }

  private calculateCasingPoints(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    config: ElementConfig,
    maxHoleSize: number
  ): Point[][] {
    const leftX = xScale((maxHoleSize - config.od) / 2);
    const topY = yScale(config.startMD);
    const bottomY = yScale(config.endMD);
    const rightX = xScale(config.od) + leftX;
    const holeSizeODDiff = xScale((config.holeSize - config.od) / 2);

    const leftPoints = [
      { x: leftX, y: topY },
      { x: leftX, y: bottomY },
      { x: leftX - holeSizeODDiff, y: bottomY },
      { x: leftX - holeSizeODDiff, y: bottomY - 3 },
      { x: leftX, y: bottomY - 10 }
    ];

    const rightPoints = [
      { x: rightX, y: topY },
      { x: rightX, y: bottomY },
      { x: rightX + holeSizeODDiff, y: bottomY },
      { x: rightX + holeSizeODDiff, y: bottomY - 3 },
      { x: rightX, y: bottomY - 10 }
    ];

    const points = [[...leftPoints], [...rightPoints]];

    return points;
  }

  private drawHole(contentGroup, holePoints: Point[]): void {
    const lineGenerator = d3
      .line<Point>()
      .x(point => point.x)
      .y(point => point.y);

    const holeContour = contentGroup
      .append("path")
      .attr("d", lineGenerator(holePoints))
      .attr("stroke", "#a0acbc")
      .attr("stroke-width", 2)
      .attr("fill", "none");
  }

  private calculateHolePoints(
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
    config: ElementConfig,
    maxHoleSize: number,
    prevBottomMD: number
  ): Point[] {
    const leftX = xScale((maxHoleSize - config.holeSize) / 2);
    const topY = yScale(prevBottomMD);
    const bottomY = yScale(config.holeMD);
    const rightX = xScale(config.holeSize) + leftX;

    const points = [
      { x: leftX, y: topY },
      { x: leftX, y: bottomY },
      { x: rightX, y: bottomY },
      { x: rightX, y: topY }
    ];
    return points;
  }

  private calculateRanges(
    config: ElementConfig
  ): { maxHoleSize: number; minMD: number; maxMD: number; prevMD: number } {
    // TODO - we should find the biggest holesize of all elements
    const maxHoleSize = config.holeSize;
    // TODO - we should find max MD
    const maxMD = config.holeMD;
    // TODO - we should find bottom MD of prev element
    const prevMD = 0;
    // TODO - we should find min MD of all elements
    const minMD = prevMD;

    return { maxHoleSize, minMD, maxMD, prevMD };
  }
}

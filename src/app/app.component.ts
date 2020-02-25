import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges
} from "@angular/core";
import * as d3 from "d3";

import { Point, ElementConfig } from "./model/index";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnChanges, AfterViewInit {
  @ViewChild("sketch") private sketchContainer: ElementRef;

  margin = { top: 20, right: 50, bottom: 20, left: 50 };

  openHoleConfig: ElementConfig = {
    type: 9,
    holeSize: 16,
    holeMD: 590
  };

  // productionCasingConfig: ElementConfig = {
  //   type: 6,
  //   holeSize: 17.5,
  //   holeMD: 1900,
  //   od: 13.375,
  //   startMD: 213,
  //   endMD: 1900,
  //   tocMD: 213
  // };

  ngAfterViewInit() {
    if (this.openHoleConfig) {
      this.createSketch();
    }
  }

  ngOnChanges() {
    if (this.openHoleConfig) {
      this.createSketch();
    }
  }

  onResize() {
    this.createSketch();
  }

  private createSketch() {
    d3.select("svg").remove();

    const element = this.sketchContainer.nativeElement;
    const config = this.openHoleConfig;

    const contentWidth =
      element.offsetWidth - this.margin.left - this.margin.right;
    const contentHeight =
      element.offsetHeight - this.margin.top - this.margin.bottom;

    const { maxHoleSize, minMD, maxMD, prevMD } = this.calculateRanges(config);

    const xScale = d3
      .scaleLinear()
      .domain([0, maxHoleSize])
      .range([0, contentWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([minMD, maxMD])
      .range([0, contentHeight]);

    const svg = d3
      .select(element)
      .append("svg")
      .attr("width", element.offsetWidth)
      .attr("height", element.offsetHeight);

    const holePoints = this.calculateOpenHolePoints(
      xScale,
      yScale,
      config,
      maxHoleSize,
      prevMD
    );
    this.drawHole(svg, holePoints);
  }

  private drawHole(svg, holePoints: Point[]) {
    const lineGenerator = d3
      .line<Point>()
      .x(point => point.x)
      .y(point => point.y);

    const g = svg
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

    const lineGraph = g
      .append("path")
      .attr("d", lineGenerator(holePoints))
      .attr("stroke", "#a0acbc")
      .attr("stroke-width", 1)
      .attr("fill", "none");
  }

  private calculateOpenHolePoints(
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
    const prevMD = 200;
    // TODO - we should find min MD of all elements
    const minMD = prevMD;

    return { maxHoleSize, minMD, maxMD, prevMD };
  }
}

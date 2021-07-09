import * as React from "react"
import * as d3 from "d3"

import { drag } from "../../util/drag"
import { sum, max } from "../../util/basicMath"

const languages = [
  "C#",
  "XSD",
  "JavaScript",
  "JSON",
  "JSX",
  "LESS",
  "Bourne Again Shell",
  "SVG",
  "HTML",
  "Markdown",
  "YAML",
]

const colors = d3.scaleOrdinal().domain(languages).range(d3.schemeDark2)

export const init = (container: HTMLDivElement, data) => {
  const containerRect = container.getBoundingClientRect()
  const HEIGHT = containerRect.height
  const WIDTH = containerRect.width
  const centre = { x: WIDTH / 2, y: HEIGHT / 2 }
  const forceStrength = 0.5

  const maxSize = d3.max(data, (d) => Math.max(d.maxValue.size))
  const radiusScale = d3.scaleSqrt().domain([0, maxSize]).range([0, 120])

  let ticked

  const SVG = d3
    .select(container)
    .append("svg")
    .attr("viewBox", [-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT])

  const forceSimulation = d3
    .forceSimulation(data)
    .force(
      "collision",
      d3.forceCollide().radius((d) => radiusScale(d.size))
    )
    .force("center", d3.forceCenter().strength(0.1))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("x", d3.forceX())
    .force("y", d3.forceY())

  const g = SVG.append("g")

  let node = g
    .selectAll("circle")
    .data(data)
    .join((enter) =>
      enter
        .append("circle")
        .attr("class", (d) => `github ${d.name}`)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => 0)
        .attr("fill", (d) => colors(d.maxValue.name))
    )

  let label = g
    .selectAll("text")
    .data(data)
    .join((enter) =>
      enter.append("text").attr("text-anchor", "start").style("opacity", 0.2)
    )

  node.transition().duration(500)

  SVG.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .scaleExtent([-100, 10])
      .on("zoom", zoomed)
  )

  let tooltip = d3.select("#tooltip")

  ticked = () => {
    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => radiusScale(d.size))
      .attr("fill", (d) => colors(d.maxValue.name))

    label
      .attr("x", (d) => d.x - 10)
      .attr("y", (d) => d.y)
      .text((d) => `${d.maxValue.percentage} % ${d.maxValue.name}`)
  }

  function zoomed({ transform }) {
    g.attr("transform", transform)
  }

  forceSimulation.stop()

  const graph = Object.assign(SVG.node(), {
    update(data) {
      const nodes = data
      const oldNodesMap = new Map(node.data().map((d) => [d.id, d]))
      const newNodes = nodes.map((d) => {
        return Object.assign(oldNodesMap.get(d.id) || {}, d)
      })

      node = node
        .data(newNodes, (d) => d.id)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("class", (d) => `github ${d.name}`)
              .attr("cx", (d) => d.x)
              .attr("cy", (d) => d.y)
              .attr("r", (d) => radiusScale(d.size)),
          (update) =>
            update
              .transition()
              .duration(750)
              .ease(d3.easeLinear)
              .attr("r", (d) => radiusScale(d.size))
        )
        .selection()

      label = g
        .selectAll("text")
        .data(newNodes, (d) => d.id)
        .join((enter) =>
          enter
            .append("text")
            .attr("text-anchor", "start")
            .style("opacity", 0.2)
        )

      node.on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .style("display", "flex")
          .style("left", event.pageX + 10 + "px")
          .style("top", `${event.pageY + d.children.length}px`).html(`
            ${d.children.map((item) => `${item.name} ${item.size}`)}
            `)
      })

      node.on("mouseout", (event, d) => {
        tooltip.style("opacity", 0).style("display", "none")
      })

      forceSimulation.nodes(newNodes)
      forceSimulation.alphaTarget(0.01).restart().tick()
      forceSimulation.on("tick", ticked)
    },
  })

  return {
    force: forceSimulation,
    graph: graph,
  }
}

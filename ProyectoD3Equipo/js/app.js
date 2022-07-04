// Selecciones
const graf = d3.select("#graf")
const metrica = d3.select("#metrica")
const ddyear = d3.select("#ddYear")

// Dimensiones
const anchoTotal = +graf.style("width").slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const margins = {
  top: 60,
  right: 20,
  bottom: 75,
  left: 100,
}
const ancho = anchoTotal - margins.left - margins.right
const alto = altoTotal - margins.top - margins.bottom

// Elementos gráficos (layers)
const svg = graf
  .append("svg")
  .attr("width", anchoTotal)
  .attr("height", altoTotal)
  .attr("class", "graf")

const layer = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)

layer
  .append("rect")
  .attr("height", alto)
  .attr("width", ancho)
  .attr("fill", "white")

const g = svg
  .append("g")
  .attr("transform", `translate(${margins.left}, ${margins.top})`)

const draw = async (optionSelected = "Compraventa_nueva") => {
  // Carga de Datos
  data = await d3.csv("mdo_inmb.csv", d3.autoType)
  
   //optionSelected para extraer el año
  var Years = data.map((i) => {
    return i.Año
  })
  Years = Years.filter((item, index) => Years.indexOf(item) === index);
  //llenar el ddl del año
   ddyear
    .selectAll("option")
    .data(Years)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)

  //llenar el ddl del resto de las opciones
  metrica
    .selectAll("option")
    .data(Object.keys(data[0]).slice(2))
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d)

  // Accessor
  const xAccessor = (d) => d.Periodo

  // Escaladores
  const y = d3.scaleLinear().range([alto, 0])

  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(data[0]).slice(1))
    .range(d3.schemeTableau10)

  const x = d3.scaleBand().range([0, ancho]).paddingOuter(0.2).paddingInner(0.1)

  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)

  const etiquetas = g.append("g")

  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  const yAxisGroup = g.append("g").classed("axis", true)

  const render = () => {
    //obtener el year seleccionado
    const yearSelected = document.getElementById("ddYear").value
    //obtener la opcion seleccionada
    const optionSelected = document.getElementById("metrica").value
    
    //filtrando por year
    const dataxYear = data.filter(r => r.Año == yearSelected)
    
    // Accesores
    const yAccessor = (d) => d[optionSelected]

    // Escaladores
    y.domain([0, d3.max(dataxYear, yAccessor)])

    x.domain(d3.map(dataxYear, xAccessor))

    // Rectángulos (Elementos)
    const rect = g.selectAll("rect").data(dataxYear, xAccessor)
    rect
      .enter()
      .append("rect")
      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", (d) => y(0))
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", "green")
      .merge(rect)
      .transition()
      .duration(2500)
      //.ease(d3.easeBounce)
      .attr("x", (d) => x(xAccessor(d)))
      .attr("y", (d) => Math.abs(y(yAccessor(d))))
      .attr("width", x.bandwidth())
      .attr("height", (d) => alto - y(yAccessor(d)))
      .attr("fill", (d) => color(optionSelected))

    const et = etiquetas.selectAll("text").data(dataxYear)
    et.enter()
      .append("text")
      .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
      .attr("y", (d) => y(0))
      .merge(et)
      .transition()
      .duration(2500)
      .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
      .attr("y", (d) => y(yAccessor(d)))
      .text(yAccessor)

    // Títulos
    titulo.text(`${optionSelected} del Mercado Inmobiliario en España`)

    // Ejes
    const xAxis = d3.axisBottom(x)
    const yAxis = d3.axisLeft(y).ticks(8)
    xAxisGroup.transition().duration(2500).call(xAxis)
    yAxisGroup.transition().duration(2500).call(yAxis)
  }

   // Eventos
   ddyear.on("change", (e) => {
    e.preventDefault()
    render()
  })

  metrica.on("change", (e) => {
    e.preventDefault()
    render()
  })
  render()
}

draw()

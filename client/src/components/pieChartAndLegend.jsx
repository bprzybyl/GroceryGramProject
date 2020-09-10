import React, { Component } from "react";
import CanvasJSReact from "../canvasjs.react";
import { getColor } from "../services/itemService";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class PieChart extends Component {
  render() {

    // create array of category objects for use in pie chart
    const { addedItems } = this.props;
    if (addedItems === null) return <React.Fragment></React.Fragment>;
    let catStats = [];
    let cats = [];
    for (let i = 0; i < addedItems.length; i++) {
      const catName = addedItems[i].category;
      if (!cats.includes(catName)) {
        cats.push(catName);
        let catObj = {
          name: catName,
          count: 1,
          cost: addedItems[i].price,
        };
        catStats.push(catObj);
      } else {
        const catArr = catStats.filter((cat) => {
          return cat.name === catName;
        });
        let catObj = catArr[0];
        catObj.count++;
        catObj.cost += addedItems[i].price;
      }
    }
    // calculate item totals
    let totalNumItems = addedItems.length;
    let totalPriceItems = 0;
    for (let i = 0; i < addedItems.length; i++) {
      totalPriceItems += addedItems[i].price;
    }
    totalPriceItems = totalPriceItems.toFixed(2); // set to 2 dec places
    // calculate percentage and add pie chart colors
    const catPercents = [];
    catStats.forEach((cat) =>
      catPercents.push({
        name: cat.name,
        y: (cat.count / totalNumItems) * 100, // calc percent of total
        color: getColor(cat.name),
      })
    );

    const options = {
      animationEnabled: true,
      data: [
        {
          type: "doughnut",
          yValueFormatString: "#,###'%'",
          dataPoints: catPercents,
        },
      ],
    };
    return (
      <React.Fragment>
        {totalNumItems > 0 && (
          <React.Fragment>
            <h5>List Summary</h5>
            <div className="totals">
              ${totalPriceItems}
              <span className="num-items">
                {totalNumItems} Item{totalNumItems > 1 ? "s" : ""}
              </span>
            </div>
            <div className="pie-chart-container">
              <CanvasJSChart
                options={options}
              />
            </div>
          </React.Fragment>
        )}
        <ul className="category-legend">
          {totalNumItems > 0 &&
            catPercents.map((cat, i) => {
              return (
                <li key={i}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor: cat.color,
                      width: "12px",
                      height: "12px",
                      marginRight: ".5em",
                    }}
                  ></span>
                  {cat.name}
                </li>
              );
            })}
        </ul>
      </React.Fragment>
    );
  }
}

export default PieChart;

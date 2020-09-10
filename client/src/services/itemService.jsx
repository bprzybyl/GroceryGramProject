import http from "./httpService";

const apiEndpoint = "/items";

// gorgeous color scheme
// https://www.pinterest.com/pin/327707310365891177/ 
const categories = [
  { _id: 1, name: "Fruit", hexColor: "#006884" },
  { _id: 2, name: "Meat/Poultry", hexColor: "#ed0026" },
  { _id: 3, name: "Grains/Cereals", hexColor: "#bf4101" },
  { _id: 4, name: "Baking Products", hexColor: "#89dbec" },
  { _id: 5, name: "Dairy", hexColor: "#6e006c" },
  { _id: 6, name: "Nuts", hexColor: "#ffd08d" },
  { _id: 7, name: "Vegetables", hexColor: "#477050" },
  { _id: 8, name: "Seafood", hexColor: "#b00051" },
  { _id: 9, name: "Condiments", hexColor: "#f68370" },
  { _id: 10, name: "Herbs/Spices", hexColor: "#feabb9" },
  { _id: 11, name: "Breads", hexColor: "#fa9d00" },
  { _id: 12, name: "Alcohol", hexColor: "#91278f" },
  { _id: 13, name: "Oils/Fats", hexColor: "#cf97d7" },
  { _id: 14, name: "Sauces/Soups/Gravies", hexColor: "#000000" },
  { _id: 15, name: "Grilling Products", hexColor: "#5b5b5b" },
  { _id: 16, name: "Pasta", hexColor: "#949494" },
  { _id: 17, name: "Other", hexColor: "#00909e" },
];

export function getItems() {
  return http.get(apiEndpoint);
}

// switch categoryies to get different color set
export function getColor(category) {
  const result = categories.filter((c) => c.name === category);
  return result[0].hexColor;
}

export default {
  getItems,
  getColor,
};

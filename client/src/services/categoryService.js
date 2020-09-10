export const categories = [
    { _id: "0", name: "" },
    { _id: "2", name: "Breakfast" },
    { _id: "3", name: "Brunch" },
    { _id: "4", name: "Lunch" },
    { _id: "5", name: "Dinner" },
    { _id: "6", name: "Snacks" },
    { _id: "7", name: "Appetizers" },
    { _id: "8", name: "Soups" },
    { _id: "9", name: "Salads" },
    { _id: "10", name: "Sides" },
    { _id: "11", name: "Pizza" },
    { _id: "12", name: "Rice" },
    { _id: "13", name: "Noodles" },
    { _id: "14", name: "Pasta" },
    { _id: "15", name: "Pies" },
    { _id: "16", name: "Burgers" },
    { _id: "17", name: "Sausages" },
    { _id: "18", name: "Chicken/Poultry" },
    { _id: "19", name: "Turkey" },
    { _id: "20", name: "Duck" },
    { _id: "21", name: "Pork" },
    { _id: "22", name: "Lamb" },
    { _id: "23", name: "Seafood" },
    { _id: "24", name: "Stir Fry" },
    { _id: "25", name: "Sauces" },
    { _id: "26", name: "Vegetarian" },
    { _id: "27", name: "Desserts" },
    { _id: "28", name: "Baking" },
    { _id: "29", name: "Drinks" },    
  ];
  
  export function getAllCategories() {
    return categories.sort((a, b) => (a.name > b.name ? 1 : -1));
  }

export function getCategories(recipes) {
  let categories = [];
  recipes.forEach(r => {
    if (!categories.includes(r.category)) {
      categories.push(r.category);
    }
  });
  let sorted = categories.sort((a, b) => (a > b ? 1 : -1));
  return ["All Categories", ...sorted];
}
  
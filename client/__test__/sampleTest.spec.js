import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, shallow } from 'enzyme';
import { Link, NavLink } from "react-router-dom";
import NavBar from '../src/components/navbar';
import AvgStarRating from '../src/components/common/avgStarRating'
import RecipeBlock from '../src/components/recipeBlock';
import { FaGgCircle } from "react-icons/fa";

// This was made with considerable help from https://devhints.io/enzyme

configure({ adapter: new Adapter() });

describe("NavBar Requirements - Not Logged In", function () {

  const wrap = shallow(<NavBar />)

  it('Has the logo', () => {
    expect(wrap.containsMatchingElement(
      <FaGgCircle />
    )).toBeTruthy()
  });

  it('Has a link to Shopping List', () => {
    expect(wrap.containsMatchingElement(
      <NavLink to="/shopping-list" className="nav-link">
        Shopping List <span className="sr-only">Home</span>
      </NavLink>
    )).toBeTruthy()
  });

  it('Has a link to My Recipes', () => {
    expect(wrap.containsMatchingElement(
      <NavLink to="/my-recipes" className="nav-link">
        My Recipes
      </NavLink>
    )).toBeTruthy()
  });

  it('Has a link to Explore Recipes', () => {
    expect(wrap.containsMatchingElement(
      <NavLink to="/explore-recipes" className="nav-link">
        Explore Recipes
      </NavLink>
    )).toBeTruthy()
  });

  it('Has a link to Register', () => {
    expect(wrap.containsMatchingElement(
      <NavLink className="nav-link" to="/register">
        Register
      </NavLink>
    )).toBeTruthy()
  });

  it('Has a link to Login', () => {
    expect(wrap.containsMatchingElement(
      <NavLink className="nav-link" to="/login">
        Login
      </NavLink>
    )).toBeTruthy()
  });

});

describe("Recipe Block Requirements", function () {
  const exampleBlock = {
    "recipe": {
      "_id": "5f1a45548988200bb09cb1b2",
      "avgRating": 4.5,
      "numReviews": 2,
      "isPublished": true,
      "title": "Grandma's Chocolate Chip Cookies",
      "userId": "5f2a54fa0039b077513f402c",
      "category": "Desserts",
      "images": [{ thumbUrl: "TestingThumbnailUrl" }],
      "user": [{ "username": "a06" }]
    },
    "forExplore": true
  }

  const wrap = shallow(<RecipeBlock {...exampleBlock} />)

  it('Has the Star Rating', () => {
    expect(wrap.containsMatchingElement(
      <AvgStarRating />
    )).toBeTruthy()
    expect(wrap.find(AvgStarRating).prop("avgRating")).toEqual(exampleBlock.recipe.avgRating);
    expect(wrap.find(AvgStarRating).prop("numReviews")).toEqual(exampleBlock.recipe.numReviews);
  });

  it('Has a link to the recipe', () => {
    expect(wrap.find(Link).prop('to'))
      .toEqual("/recipes/" + exampleBlock.recipe._id)
  });

  it('Has the recipe name', () => {
    expect(wrap.text()).toContain(exampleBlock.recipe.title);
  });

  it('Has the recipe image', () => {
    expect(wrap.find('img').prop("src")).toEqual("TestingThumbnailUrl");
  });

  it('Has the user name', () => {
    expect(wrap.text()).toContain(exampleBlock.recipe.user[0].username);
  });
});

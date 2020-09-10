const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;

chai.use(chaiHttp);
describe("GroceryGram Backend Tests", function () {

  it("Post /auth - No Credentials", done => {
    chai
      .request(app)
      .post("/api/auth")
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.not.have.header("x-auth-token");
        done();
      })
  });

  it("Post /auth - Incorrect email", done => {
    chai
      .request(app)
      .post("/api/auth")
      .send({ email: "aint@no.email", password: "brooks" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.not.have.header("x-auth-token");
        done();
      })
  });

  it("Post /auth - Incorrect Password", done => {
    chai
      .request(app)
      .post("/api/auth")
      .send({ email: "bp@bp.com", password: "NoThatsNotMyPassword" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.not.have.header("x-auth-token");

        done();
      })
  });

  let authToken = "";

  it("Post /auth - Get Token", done => {
    chai
      .request(app)
      .post("/api/auth")
      .send({ email: "bp@bp.com", password: "brooks" })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header("x-auth-token");

        authToken = res.header["x-auth-token"];

        done();
      })
  });

  it("GET /users - No Token", done => {
    chai
      .request(app)
      .get("/api/users")
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.not.be.a('array');

        done();
      });
  });

  it("GET /users - Check Response", done => {
    chai
      .request(app)
      .get("/api/users")
      .set("x-auth-token", authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.not.eql(0);

        let testUser = res.body[0];

        expect(testUser).to.have.property("_id");
        expect(testUser._id).to.be.a("string");

        expect(testUser).to.have.property("username");
        expect(testUser.username).to.be.a("string");

        expect(testUser).to.have.property("email");
        expect(testUser.email).to.be.a("string");

        expect(testUser).to.have.property("addedItems");
        expect(testUser.addedItems).to.be.a("array");

        expect(testUser).to.have.property("removedItems");
        expect(testUser.addedItems).to.be.a("array");

        expect(testUser).to.have.property("itemCounts");
        expect(testUser.addedItems).to.be.a("array");

        expect(testUser).to.have.property("savedRecipes");
        expect(testUser.addedItems).to.be.a("array");

        expect(testUser).to.have.property("reviews");
        expect(testUser.reviews).to.be.a("array");

        done();
      });
  });

  it("GET /items - Check Response", done => {
    chai
      .request(app)
      .get("/api/items")
      .set("x-auth-token", authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.not.eql(0);

        let testItem = res.body[0];

        expect(testItem).to.have.property("name");
        expect(testItem._id).to.be.a("string");

        expect(testItem).to.have.property("category");
        expect(testItem.category).to.be.a("string");

        expect(testItem).to.have.property("price");
        expect(testItem.price).to.be.a("number");

        done();
      });
  });

  it("GET /recipes - Check Response", done => {
    chai
      .request(app)
      .get("/api/recipes")
      .set("x-auth-token", authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.not.eql(0);

        let testRecipe = res.body[0];

        expect(testRecipe).to.have.property("avgRating");
        expect(testRecipe.avgRating).to.be.a("number");

        expect(testRecipe).to.have.property("numReviews");
        expect(testRecipe.numReviews).to.be.a("number");

        expect(testRecipe).to.have.property("isPublished");
        expect(testRecipe.isPublished).to.be.a("boolean");

        expect(testRecipe).to.have.property("userId");
        expect(testRecipe.userId).to.be.a("string");

        expect(testRecipe).to.have.property("category");
        expect(testRecipe.category).to.be.a("string");

        expect(testRecipe).to.have.property("images");
        expect(testRecipe.images).to.be.a("array");
        expect(testRecipe.images[0]).to.have.property("fullsizeUrl");
        expect(testRecipe.images[0]).to.have.property("fullsizeHeight")
        expect(testRecipe.images[0]).to.have.property("fullsizeWidth")
        expect(testRecipe.images[0]).to.have.property("thumbUrl")
        expect(testRecipe.images[0]).to.have.property("thumbHeight")
        expect(testRecipe.images[0]).to.have.property("thumbWidth")

        expect(testRecipe).to.have.property("instructions");
        expect(testRecipe.instructions).to.be.a("string");

        expect(testRecipe).to.have.property("ingredients");
        expect(testRecipe.ingredients).to.be.a("array");

        expect(testRecipe).to.have.property("createdOn");
        expect(testRecipe.createdOn).to.be.a("string");

        expect(testRecipe).to.have.property("reviews");
        expect(testRecipe.reviews).to.be.a("array");

        done();
      });
  });

  it("GET /reviews - Check Response", done => {
    chai
      .request(app)
      .get("/api/reviews")
      .set("x-auth-token", authToken)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.not.eql(0);

        let testReview = res.body[0];

        expect(testReview).to.have.property("rating");
        expect(testReview.rating).to.be.a("number");

        expect(testReview).to.have.property("comments");
        expect(testReview.comments).to.be.a("string");

        expect(testReview).to.have.property("username");
        expect(testReview.username).to.be.a("string");

        expect(testReview).to.have.property("recipeId");
        expect(testReview.recipeId).to.be.a("string");

        expect(testReview).to.have.property("userId");
        expect(testReview.userId).to.be.a("string");

        done();
      });
  });

});

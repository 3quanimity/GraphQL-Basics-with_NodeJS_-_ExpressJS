//****************************************************************************************************************************************************************************/
// IMPORTING
const express = require('express');
const expressGraphQL = require('express-graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInt
} = require('graphql');

const app = express();

//****************************************************************************************************************************************************************************/
// DUMMY DATA
const authors = [
  { id: 1, name: 'J. K. Rowling' },
  { id: 2, name: 'J. R. R. Tolkien' },
  { id: 3, name: 'Brent Weeks' }
];

const books = [
  { id: 1, title: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
  { id: 2, title: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
  { id: 3, title: 'Harry Potter and the Goblet of Fire', authorId: 1 },
  { id: 4, title: 'The Fellowship of the Ring', authorId: 2 },
  { id: 5, title: 'The Two Towers', authorId: 2 },
  { id: 6, title: 'The Return of the King', authorId: 2 },
  { id: 7, title: 'The Way of Shadows', authorId: 3 },
  { id: 8, title: 'Beyond the Shadows', authorId: 3 }
];

//****************************************************************************************************************************************************************************/
// // creating schemas
// const schema = new GraphQLSchema({
//   //query section : getting data
//   query: new GraphQLObjectType({
//     name: "HelloWorldQuery",
//     // fields : all the different sections of an object that we can query to return data from
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         // the resolver section, a function that tells graphQL where to get the information from
//         // resolve can take some args such as "parent" that its being called from
//         // and diff "args" that can be passed to the query
//         resolve: () => "Hello World (result of a resolve func"
//       }
//     })
//   })
// });

//****************************************************************************************************************************************************************************/
// defining the custom BookType that we'll be using in our query
const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: book => {
        return authors.find(author => author.id === book.authorId);
      }
    }
  })
});

// defining the custom AuthorType
const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: author => {
        return books.filter(book => book.authorId === author.id);
      }
    }
  })
});

//****************************************************************************************************************************************************************************/
// creating a "Root Query Scope/object" (that everrything is gonna pull down from)
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A Single Book',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => books.find(book => book.id === args.id)
    },

    books: {
      // in this case books is a CUSTOM graphQLType that we need to create
      type: new GraphQLList(BookType),
      description: 'List of all books',
      // where we should query the DB !!! (in this case its our dummy data)
      resolve: () => books
    },

    authors: {
      // in this case books is a CUSTOM graphQLType that we need to create
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      // where we should query the DB !!! (in this case its our dummy data)
      resolve: () => authors
    },

    author: {
      type: AuthorType,
      description: 'A Single Author',
      args: {
        id: { type: GraphQLInt }
      },
      resolve: (parent, args) => authors.find(author => author.id === args.id)
    }
  })
});

//****************************************************************************************************************************************************************************/
// creating the Root Mutation Object (for editing data)
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    // adding a book (soubld be but not) to the DB
    addBook: {
      type: BookType,
      description: 'Add a book',
      args: {
        title: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          title: args.title,
          authorId: args.authorId
        };
        books.push(book);
        return book;
      }
    },

    // adding an author (soubld be but not) to the DB
    addAuthor: {
      type: AuthorType,
      description: 'Add an Author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name
        };
        authors.push(author);
        return author;
      }
    }
  })
});

//****************************************************************************************************************************************************************************/
// creating the Schema
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

//****************************************************************************************************************************************************************************/
// adding a graphQL root to the app = single endpoint
//!\ GraphQL middleware function must contain a schema!
app.use(
  '/graphql',
  expressGraphQL({
    schema: schema,
    graphiql: true // gives us a UI to access our server without having to use postman for exp
  })
);

//****************************************************************************************************************************************************************************/
// listening to port 5000
app.listen(5000, () => console.log('Server is running ...'));

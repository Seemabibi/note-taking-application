const express = require("express");
const path = require("path");
const uuid = require("./helpers/uuid");
const fs = require("fs");

//setting up port
const PORT = process.env.PORT || 3001;

//setting up an instance of express
const app = express();
//middleware to say we are dealing with json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving up static data from the public folder
app.use(express.static("public"));

//GET route to serve home page to the client for the default route
app.get("/", (req, res) =>
  res.send(path.join(__dirname, "/public/index.html"))
);

//GET route to serve notes page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);

app.get("/api/notes", (req, res) => {
  console.info(`${req.method} req recieved to get notes`);
  //returning the reviews in json format from the db
  fs.readFile("./db/db.json", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const parsedNotes = JSON.parse(data);

      res.status(200).json(parsedNotes);
    }
  });
});

// post request to add a new note @/api/notes
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);
  //destructuring the request body and creating an object
  const { title, text } = req.body;
  //if both entries have been entered then creates new object containing data
  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    //reading in the existing data from the database
    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        //converted the string into a javascript json object
        const parsedNotes = JSON.parse(data);
        //pushes the new review into the existing data object
        parsedNotes.push(newNote);

        //writing the new updates data back to the file and stringify
        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (err) =>
          err
            ? console.error(err)
            : console.info("note has been added to database")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    //this will log the new response that will be posted (if successful)
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting review");
  }
});

app.delete("/api/notes/:id", (req, res) => {
  console.info(`${req.params.id} request received to delete a note`);

  //read in data from databse
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
    } else {
      //else

      //convert the string into a js json object
      //filter through notes to find id
      const parsedNotes = JSON.parse(data);
      const filterNotes = parsedNotes.filter(
        (note) => note.id !== req.params.id
      );
      console.info(filterNotes);

      fs.writeFile("./db/db.json", JSON.stringify(filterNotes), (err) =>
        err
          ? console.error(err)
          : console.info("note has been deleted from the database")
      );
    }
  });

  const response = {
    status: "success",
    body: "note was deleted",
  };
  res.status(201).json(response);
});

app.listen(PORT, () =>
  console.log(`Serving static asset routes at http://localhost:${PORT}`)
);

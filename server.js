const express = require('express');
const Sequelize = require('sequelize');
const _USERS = require ('./users.json');
const Op = Sequelize.Op;
const app = express();
const port = 8001;

const connection = new Sequelize('db', 'user', 'pass', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'db.sqlite',
    // define: {
    //     freezeTableName: true
    // }
});


const User = connection.define('User', {
    name: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        validate: {
            isAlphanumeric: true
        }
    }
});

const Post = connection.define('Post', {
    title: Sequelize.STRING,
    content: Sequelize.TEXT
});

const Comment = connection.define('Comment', {
    the_comment: Sequelize.STRING
});

const Project = connection.define('Project', {
    title : Sequelize.STRING
});


app.get('/allposts', (req, res) => {
   Post.findAll({
       include: [{
           model: User,
           as: 'UserRef'
       }]
   })
   .then(posts => {
       res.json(posts);
   })
   .catch( error => {
       console.log(error);
       res.status(404).send(error);
   });
});

app.get('/getUserProjects', (req, res) => {
   User.findAll({
       attributes: ['name'],
       include: [{
           model: Project,
           as: 'Tasks',
           attributes: ['title']
       }]
   })
   .then(output => {
       res.json(output);
   })
   .catch( error => {
       console.log(error);
       res.status(404).send(error);
   });
});

app.put('/addworker', (req, res) => {
   Project.findByPk(2).then( project => { project.addWorkers(5); })
   .then(() => {
       res.send('User Added');
   })
   .catch( error => {
       console.log(error);
       res.status(404).send(error);
   });
});

app.get('/singlepost', (req, res) => {
   Post.findByPk('1', {
       include: [{
           model: Comment,
           as: 'All_Comments',
           attributes: ['the_comment']
       },
       {
           model: User,
           as: 'UserRef'
       }]
   })
   .then(posts => {
       res.json(posts);
   })
   .catch( error => {
       console.log(error);
       res.status(404).send(error);
   });
});


// ONE TO ONE
Post.belongsTo(User, {
    as: 'UserRef',
    foreignKey: 'userId'
}); //puts foreignKey UserId in Post table

// Same as belongsTo (puts the foreign key in the opposite table
// User.hasOne(Post);

//ONE TO MANY
// User.hasMany(Post)
Post.hasMany(Comment, {
    as: 'All_Comments'
}); //puts foreignKey postId in Comment table

//MANY TO MANY (we use belong to many in BOTH models
// User.belongsToMany(Post);
// Post.belongsToMany(User);

//Creates a UserProjects table with IDs for ProjectId and UserId
User.belongsToMany(Project, {as: 'Tasks', through:'UserProjects'});
Project.belongsToMany(User, {as: 'Workers', through: 'UserProjects'});


connection
    .sync({
        // force: true
        // logging: console.log
    })
    // .then(() => {
    //     User.bulkCreate(_USERS)
    //         .then(users => {
    //             console.log("Successfully adding users");
    //         })
    //         .catch(error => {
    //             console.error(error);
    //         })
    // })
    // .then(() => {
    //     Post.create({
    //         userId: 1,
    //         title: 'First Post',
    //         content: 'post content 1'
    //     })
    // })
    // .then(() => {
    //     Post.create({
    //         userId: 1,
    //         title: 'Second Post',
    //         content: 'post content 2'
    //     })
    // })
    // .then(() => {
    //     Post.create({
    //         userId: 2,
    //         title: 'Third Post',
    //         content: 'post content 3'
    //     })
    // })
    // .then(() => {
    //     Comment.create({
    //         PostId: 1,
    //         the_comment: 'my comment'
    //     })
    // })
    // .then(() => {
    //     Comment.create({
    //         PostId: 1,
    //         the_comment: 'my comment 2'
    //     })
    // })
    // .then(() => {
    //     Project.create({
    //         title: 'project1'
    //     })
    //     .then( project => {
    //         project.setWorkers([4, 5]);
    //     });
    // })
    // .then(() => {
    //     Project.create({
    //         title: 'project2'
    //     })
    // })
    .then(() => {
        console.log('Connection to db successfully established');
    })
    .catch(err => {
        console.error('Unable to connect to the database', err);
    });

app.listen(port, () => {
    console.log(`Running server on port ${port}`);
});

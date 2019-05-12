const express = require('express');
const Sequelize = require('sequelize');

const app = express();
const port = 8001;

const connection = new Sequelize('db', 'user', 'pass', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: 'db.sqlite',
    define: {
        freezeTableName: true
    }
});


const User = connection.define('User', {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        first: Sequelize.STRING,
        last: Sequelize.STRING,
        full_name: Sequelize.STRING,
        bio: Sequelize.TEXT
        // name: {
        //     type: Sequelize.STRING,
        //     validate: {
        //         len: [3]
        //     }
        // },
        // bio: {
        //     type: Sequelize.TEXT,
        //     validate: {
        //         contains: {
        //             args: ['foo'],
        //             msg: 'Error: Field must contains foo'
        //         }
        //     }
        // }
    },
    {
        // timestamps: false
        hooks: {
            beforeValidate: () => {
                console.log('Before validate');
            },
            afterValidate: () => {
                console.log('After validate');
            },
            beforeCreate: (user) => {
                user.full_name = `${user.first} ${user.last}`
                console.log('Before create');
            },
            afterCreate: () => {
                console.log('After create');
            },
        }
    });

app.get('/', (req, res) => {
    User.create({
        name: 'Jo',
        bio: 'New bio entry'
    })
    .then(user => {
        res.json(user);
    })
    .catch( error => {
        console.log(error);
        res.status(404).send(error);
    })
});

connection
    .sync({
        force: true,
        logging: console.log
    })
    .then(() => {
        User.create({
            first: 'Joe',
            last: 'Smith',
            bio: 'New bio entry'
        })
    })
    .then(() => {
        console.log('Connection to db successfully established');
    })
    .catch(err => {
        console.error('Unable to connect to the database', err);
    });

app.listen(port, () => {
    console.log(`Running server on port ${port}`);
});

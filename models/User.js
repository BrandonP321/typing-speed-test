const bcrypt = require('bcrypt');

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        underscored: true
    });

    // before user is created
    User.beforeCreate(function (user) {
        // encrypt password
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    })

    // User.associate = function(models) {
    //     User.belongsToMany(models.Job, {through: "User_Job"})
    // }

    return User;
}
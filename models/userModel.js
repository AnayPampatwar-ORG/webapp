module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("user", {
   //////

   id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    readOnly: true
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    writeOnly: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
    // validate: {
    //   isEmail: true
    // }
  },
  account_created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    readOnly: true
  },
  account_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    readOnly: true
  }
    }, {timestamps: false});
    return User;
}

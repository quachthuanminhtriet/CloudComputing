module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    birthday: { type: DataTypes.DATE },
    avatarUrl: { type: DataTypes.STRING },
    fullName: { type: DataTypes.STRING },
  });
  return User;
};

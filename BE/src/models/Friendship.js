module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define("Friendship", {
    status: { type: DataTypes.ENUM("pending", "accepted", "blocked"), defaultValue: "pending" }
  });

  return Friendship;
};

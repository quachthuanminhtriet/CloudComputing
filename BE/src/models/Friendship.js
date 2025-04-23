module.exports = (sequelize, DataTypes) => {
  const Friendship = sequelize.define("Friendship", {
    status: { type: DataTypes.ENUM("pending", "accepted", "cancel"), defaultValue: "pending" }
  });

  return Friendship;
};

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    age: {
      type: Sequelize.INTEGER,
    },

    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },

    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("users");
}

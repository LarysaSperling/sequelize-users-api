export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("posts", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    published: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    views: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("posts");
}

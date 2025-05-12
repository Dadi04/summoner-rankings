using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedIdToPlayerBasicInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayersBasicInfo");

            migrationBuilder.AddColumn<int>(
                name: "PlayerBasicInfoId",
                table: "Players",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PlayerBasicInfo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SummonerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerTag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerBasicInfo", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Players_PlayerBasicInfoId",
                table: "Players",
                column: "PlayerBasicInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_PlayerBasicInfo_PlayerBasicInfoId",
                table: "Players",
                column: "PlayerBasicInfoId",
                principalTable: "PlayerBasicInfo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_PlayerBasicInfo_PlayerBasicInfoId",
                table: "Players");

            migrationBuilder.DropTable(
                name: "PlayerBasicInfo");

            migrationBuilder.DropIndex(
                name: "IX_Players_PlayerBasicInfoId",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PlayerBasicInfoId",
                table: "Players");

            migrationBuilder.CreateTable(
                name: "PlayersBasicInfo",
                columns: table => new
                {
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerTag = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayersBasicInfo", x => x.PlayerId);
                    table.ForeignKey(
                        name: "FK_PlayersBasicInfo_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
        }
    }
}

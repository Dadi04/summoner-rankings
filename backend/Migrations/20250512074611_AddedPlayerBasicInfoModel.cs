using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedPlayerBasicInfoModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Region",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "SummonerName",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "SummonerTag",
                table: "Players");

            migrationBuilder.CreateTable(
                name: "PlayersBasicInfo",
                columns: table => new
                {
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    SummonerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerTag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: false)
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayersBasicInfo");

            migrationBuilder.AddColumn<string>(
                name: "Region",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SummonerName",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SummonerTag",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}

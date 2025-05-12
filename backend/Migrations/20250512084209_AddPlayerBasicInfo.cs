using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerBasicInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_PlayerBasicInfo_PlayerBasicInfoId",
                table: "Players");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayerBasicInfo",
                table: "PlayerBasicInfo");

            migrationBuilder.RenameTable(
                name: "PlayerBasicInfo",
                newName: "PlayersBasicInfo");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayersBasicInfo",
                table: "PlayersBasicInfo",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_PlayersBasicInfo_PlayerBasicInfoId",
                table: "Players",
                column: "PlayerBasicInfoId",
                principalTable: "PlayersBasicInfo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Players_PlayersBasicInfo_PlayerBasicInfoId",
                table: "Players");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlayersBasicInfo",
                table: "PlayersBasicInfo");

            migrationBuilder.RenameTable(
                name: "PlayersBasicInfo",
                newName: "PlayerBasicInfo");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlayerBasicInfo",
                table: "PlayerBasicInfo",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Players_PlayerBasicInfo_PlayerBasicInfoId",
                table: "Players",
                column: "PlayerBasicInfoId",
                principalTable: "PlayerBasicInfo",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

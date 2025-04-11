using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddedRankedFlexDataToPlayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PreferredRoleData",
                table: "Players",
                newName: "SoloDuoMatchesDetailsData");

            migrationBuilder.RenameColumn(
                name: "MatchesData",
                table: "Players",
                newName: "SoloDuoMatchesData");

            migrationBuilder.RenameColumn(
                name: "ChampionStatsData",
                table: "Players",
                newName: "PreferredSoloDuoRoleData");

            migrationBuilder.AddColumn<string>(
                name: "ChampionStatsFlexData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ChampionStatsSoloDuoData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FlexMatchesData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FlexMatchesDetailsData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredFlexRoleData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChampionStatsFlexData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ChampionStatsSoloDuoData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "FlexMatchesData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "FlexMatchesDetailsData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PreferredFlexRoleData",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "SoloDuoMatchesDetailsData",
                table: "Players",
                newName: "PreferredRoleData");

            migrationBuilder.RenameColumn(
                name: "SoloDuoMatchesData",
                table: "Players",
                newName: "MatchesData");

            migrationBuilder.RenameColumn(
                name: "PreferredSoloDuoRoleData",
                table: "Players",
                newName: "ChampionStatsData");
        }
    }
}

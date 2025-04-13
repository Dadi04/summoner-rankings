using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangedPlayer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.RenameColumn(
                name: "SoloDuoMessage",
                table: "Players",
                newName: "allMatchIds");

            migrationBuilder.RenameColumn(
                name: "SoloDuoMatchesDetailsData",
                table: "Players",
                newName: "RankedSoloRoleStatsData");

            migrationBuilder.RenameColumn(
                name: "SoloDuoMatchesData",
                table: "Players",
                newName: "RankedSoloChampionStatsData");

            migrationBuilder.RenameColumn(
                name: "PreferredSoloDuoRoleData",
                table: "Players",
                newName: "RankedFlexRoleStatsData");

            migrationBuilder.RenameColumn(
                name: "PreferredFlexRoleData",
                table: "Players",
                newName: "RankedFlexChampionStatsData");

            migrationBuilder.RenameColumn(
                name: "Last20MatchesData",
                table: "Players",
                newName: "AllMatchesDetailsData");

            migrationBuilder.RenameColumn(
                name: "FlexMessage",
                table: "Players",
                newName: "AllGamesRoleStatsData");

            migrationBuilder.RenameColumn(
                name: "FlexMatchesDetailsData",
                table: "Players",
                newName: "AllGamesChampionStatsData");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "allMatchIds",
                table: "Players",
                newName: "SoloDuoMessage");

            migrationBuilder.RenameColumn(
                name: "RankedSoloRoleStatsData",
                table: "Players",
                newName: "SoloDuoMatchesDetailsData");

            migrationBuilder.RenameColumn(
                name: "RankedSoloChampionStatsData",
                table: "Players",
                newName: "SoloDuoMatchesData");

            migrationBuilder.RenameColumn(
                name: "RankedFlexRoleStatsData",
                table: "Players",
                newName: "PreferredSoloDuoRoleData");

            migrationBuilder.RenameColumn(
                name: "RankedFlexChampionStatsData",
                table: "Players",
                newName: "PreferredFlexRoleData");

            migrationBuilder.RenameColumn(
                name: "AllMatchesDetailsData",
                table: "Players",
                newName: "Last20MatchesData");

            migrationBuilder.RenameColumn(
                name: "AllGamesRoleStatsData",
                table: "Players",
                newName: "FlexMessage");

            migrationBuilder.RenameColumn(
                name: "AllGamesChampionStatsData",
                table: "Players",
                newName: "FlexMatchesDetailsData");

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
        }
    }
}

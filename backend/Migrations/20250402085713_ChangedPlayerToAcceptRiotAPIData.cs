using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangedPlayerToAcceptRiotAPIData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LeaguePoints",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "Level",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "Rank",
                table: "Players",
                newName: "TopMasteriesData");

            migrationBuilder.AddColumn<string>(
                name: "ChallengesData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ChampionStatsData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ClashData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EntriesData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MatchesData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PlayerData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredRoleData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RankedMatchesData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SpectatorData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SummonerData",
                table: "Players",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChallengesData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ChampionStatsData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "ClashData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "EntriesData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "MatchesData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PlayerData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PreferredRoleData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "RankedMatchesData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "SpectatorData",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "SummonerData",
                table: "Players");

            migrationBuilder.RenameColumn(
                name: "TopMasteriesData",
                table: "Players",
                newName: "Rank");

            migrationBuilder.AddColumn<int>(
                name: "LeaguePoints",
                table: "Players",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Level",
                table: "Players",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}

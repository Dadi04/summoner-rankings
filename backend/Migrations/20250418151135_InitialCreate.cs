using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SummonerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerTag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Puuid = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlayerData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntriesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TopMasteriesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllMatchIds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllMatchesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllGamesChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllGamesRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedSoloChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedSoloRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedFlexChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedFlexRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChallengesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpectatorData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClashData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddedAt = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Races",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Races", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlayerRace",
                columns: table => new
                {
                    PlayersId = table.Column<int>(type: "int", nullable: false),
                    RacesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerRace", x => new { x.PlayersId, x.RacesId });
                    table.ForeignKey(
                        name: "FK_PlayerRace_Players_PlayersId",
                        column: x => x.PlayersId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayerRace_Races_RacesId",
                        column: x => x.RacesId,
                        principalTable: "Races",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerRace_RacesId",
                table: "PlayerRace",
                column: "RacesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerRace");

            migrationBuilder.DropTable(
                name: "Players");

            migrationBuilder.DropTable(
                name: "Races");
        }
    }
}

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
                name: "PlayersBasicInfo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SummonerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SummonerTag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProfileIcon = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayersBasicInfo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isAdmin = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerBasicInfoId = table.Column<int>(type: "int", nullable: false),
                    Puuid = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    SummonerData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntriesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MasteriesData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TotalMasteryScoreData = table.Column<int>(type: "int", nullable: false),
                    AllMatchIds = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllGamesChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllGamesRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedSoloChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedSoloRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedFlexChampionStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RankedFlexRoleStatsData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SpectatorData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddedAt = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Players_PlayersBasicInfo_PlayerBasicInfoId",
                        column: x => x.PlayerBasicInfoId,
                        principalTable: "PlayersBasicInfo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SummonerName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Region = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Races",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsPublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndingOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Races", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Races_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlayerMatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlayerId = table.Column<int>(type: "int", nullable: false),
                    MatchIndex = table.Column<int>(type: "int", nullable: false),
                    MatchJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerMatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerMatches_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RacePlayers",
                columns: table => new
                {
                    RaceId = table.Column<int>(type: "int", nullable: false),
                    PlayerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RacePlayers", x => new { x.RaceId, x.PlayerId });
                    table.ForeignKey(
                        name: "FK_RacePlayers_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RacePlayers_Races_RaceId",
                        column: x => x.RaceId,
                        principalTable: "Races",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_SummonerName_Region",
                table: "Favorites",
                columns: new[] { "UserId", "SummonerName", "Region" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerMatches_PlayerId_MatchIndex",
                table: "PlayerMatches",
                columns: new[] { "PlayerId", "MatchIndex" });

            migrationBuilder.CreateIndex(
                name: "IX_Players_PlayerBasicInfoId",
                table: "Players",
                column: "PlayerBasicInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_Players_Puuid",
                table: "Players",
                column: "Puuid");

            migrationBuilder.CreateIndex(
                name: "IX_RacePlayers_PlayerId",
                table: "RacePlayers",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_Races_UserId_IsPublic",
                table: "Races",
                columns: new[] { "UserId", "IsPublic" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "PlayerMatches");

            migrationBuilder.DropTable(
                name: "RacePlayers");

            migrationBuilder.DropTable(
                name: "Players");

            migrationBuilder.DropTable(
                name: "Races");

            migrationBuilder.DropTable(
                name: "PlayersBasicInfo");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

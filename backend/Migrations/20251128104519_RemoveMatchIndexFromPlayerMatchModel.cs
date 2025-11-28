using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMatchIndexFromPlayerMatchModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlayerMatches_PlayerId_MatchIndex",
                table: "PlayerMatches");

            migrationBuilder.DropColumn(
                name: "MatchIndex",
                table: "PlayerMatches");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerMatches_PlayerId",
                table: "PlayerMatches",
                column: "PlayerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlayerMatches_PlayerId",
                table: "PlayerMatches");

            migrationBuilder.AddColumn<int>(
                name: "MatchIndex",
                table: "PlayerMatches",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerMatches_PlayerId_MatchIndex",
                table: "PlayerMatches",
                columns: new[] { "PlayerId", "MatchIndex" });
        }
    }
}

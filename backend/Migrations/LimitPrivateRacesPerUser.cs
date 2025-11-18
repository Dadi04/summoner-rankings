using Microsoft.EntityFrameworkCore.Migrations;

namespace backend.Migrations {
    public partial class LimitPrivateRacesPerUser : Migration {
        protected override void Up(MigrationBuilder migrationBuilder) {
            migrationBuilder.Sql(@"
                CREATE TRIGGER trg_Race_Enforce_PrivateLimit_And_AdminRules
                ON dbo.Race
                AFTER INSERT, UPDATE
                AS
                BEGIN
                    SET NOCOUNT ON;

                    IF EXISTS (
                        SELECT 1
                        FROM inserted i
                        JOIN dbo.[User] u ON u.Id = i.UserId
                        WHERE i.IsPublic = 1 AND u.IsAdmin = 0
                    )
                    BEGIN
                        RAISERROR('Only administrators can create public races.', 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END

                    IF EXISTS (
                        SELECT 1
                        FROM inserted i
                        JOIN deleted d ON d.Id = i.Id
                        JOIN dbo.[User] u ON u.Id = i.UserId
                        WHERE d.IsPublic = 0 AND i.IsPublic = 1 AND u.IsAdmin = 0
                    )
                    BEGIN
                        RAISERROR('Only administrators can make a race public.', 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END

                    IF EXISTS (
                        SELECT 1
                        FROM (
                            SELECT DISTINCT COALESCE(i.UserId, d.UserId) AS UserId
                            FROM inserted i
                            FULL OUTER JOIN deleted d ON i.Id = d.Id
                        ) AS uids
                        CROSS APPLY (
                            SELECT COUNT(*) AS cnt
                            FROM dbo.Race r WITH (UPDLOCK, HOLDLOCK)
                            WHERE r.UserId = uids.UserId AND r.IsPublic = 0
                        ) AS counts
                        WHERE counts.cnt > 5
                    )
                    BEGIN
                        RAISERROR('A user cannot have more than 5 private races.', 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                END;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder) {
            migrationBuilder.Sql(@"DROP TRIGGER IF EXISTS trg_Race_Enforce_PrivateLimit_And_AdminRules;");
        }
    }
}
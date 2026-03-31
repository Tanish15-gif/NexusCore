using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using NexusCore.StaffListDto;
using System.Collections.Generic;

namespace NexusCore.AdminOperation
{
    public class ShowStaffListInAdmin
    {
        public readonly string? conn;
        public ShowStaffListInAdmin(IConfiguration config)
        {
            conn = config.GetConnectionString("DefaultConnection");
        }
        public List<StaffList> GetStaffList()
        {
            List<StaffList> showStaff = new List<StaffList>();
            using (var connect = new SqlConnection(conn))
            {
                connect.Open();
                string sql = @"
                    select u.UserId,e.EmployeeName,u.Email,u.Role
                    from Users u
                    join EmployeeProfiles e on u.UserId = e.UserId
                    where u.Role != 'SuperAdmin'
                ";
                using (var cmd = new SqlCommand(sql, connect))
                {
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            showStaff.Add(new StaffList
                            {
                                UserId = (int)reader["UserId"],
                                Name = reader["EmployeeName"].ToString(),
                                Email = reader["Email"].ToString(),
                                CurrentRole = reader["Role"].ToString()
                            });
                        }
                    }
                }
            }
            return showStaff;
        }
    }
}
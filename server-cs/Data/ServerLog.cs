namespace server_cs.Data
{
    public sealed class ServerLog
    {
        public static bool IsLogEnabled { get; set; } = false;
        private static string Path = @"..\server-cs\Data\Logs\";

        public static void EnableLog()
        {
            IsLogEnabled = true;
            Log($"Loging enabled (Path: {Path})");
        }

        public static async void Log(string message) {
            if (!IsLogEnabled) return;
            
            string log = $"[{DateTime.Now.ToString("HH:mm:ss")}] {message}";
            string fileName = Path + $"log_{DateTime.Now.ToString("dd-MM-yyyy")}.txt";

            if (!Directory.Exists(Path)) Directory.CreateDirectory(Path);

            using (StreamWriter fs = new StreamWriter(fileName, true, System.Text.Encoding.Default))
            {
                Console.WriteLine(log);
                await fs.WriteLineAsync(log);
            }
            
        }
    }
}

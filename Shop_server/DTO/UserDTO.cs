using System.ComponentModel.DataAnnotations;

namespace Shop_server.DTO
{
    public class UserDTO
    {
        [Required(ErrorMessage = "A felhasználónév megadása kötelező!")]
        [StringLength(30, MinimumLength = 5, ErrorMessage = "A felhasználónév 5 és 30 karakter között kell legyen!")]
        [RegularExpression(@"^[^@?!%$#:,.]*$", ErrorMessage = "A felhasználónév nem tartalmazhat speciális karaktereket!")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Az email megadása kötelező!")]
        [EmailAddress(ErrorMessage = "Érvényes email címet adjon meg!")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A születési dátum megadása kötelező!")]
        public DateTime Birth { get; set; }

        [Required(ErrorMessage = "A jelszó megadása kötelező!")]
        [StringLength(50, MinimumLength = 5, ErrorMessage = "A jelszónak legalább 5 karakterből kell állnia!")]
        public String Password { get; set; }

    }
}

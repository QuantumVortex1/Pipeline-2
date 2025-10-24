import subprocess
import pickle
import sys

# Harmlos aussehende, aber gefährliche Funktion
def run_command(command):
    # CWE-78: Ungeprüfte Einbindung eines Befehls
    subprocess.call(command, shell=True)

# Deserialisierung von unsicheren Daten
def load_user_data(data):
    # CWE-502: Deserialisierung von nicht vertrauenswürdigen Daten
    return pickle.loads(data)

# Beispiel für die Verwendung
if __name__ == "__main__":
    # Bandit wird hier eine SQL-Injection-Schwachstelle erkennen
    user_input = input("Bitte geben Sie Ihren Benutzernamen ein: ")
    query = "SELECT * FROM users WHERE username = '" + user_input + "'"
    print(f"Führe aus: {query}")

    # Bandit warnt auch vor der Verwendung von exec
    exec("print('Hallo Welt')")

    # Harte Codierung von Passwörtern ist ein weiteres häufiges Problem
    password = "supergeheimespasswort123"

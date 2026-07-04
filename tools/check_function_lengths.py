#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def analyze_functions(file_paths: list[Path]):
    for path in file_paths:
        if not path.exists():
            print(f"WARNUNG: Datei nicht gefunden: {path}")
            continue
            
        try:
            content = path.read_text(encoding='utf-8')
        except Exception as e:
            print(f"FEHLER beim Lesen von {path}: {e}")
            continue

        lines = content.splitlines()
        
        # Regex für Funktionendefinitionen (mit oder ohne async)
        start_re = re.compile(r'^\s*(async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(')
        
        print(f"\n--- Analyse: {path.name} ---")
        
        i = 0
        while i < len(lines):
            match = start_re.match(lines[i])
            
            if not match:
                i += 1
                continue
            
            func_name = match.group(2)
            
            depth = 0
            started = False
            start_line_idx = i
            
            for j in range(i, len(lines)):
                line = lines[j]
                
                if not started:
                    # Suche den ersten { ab der Definition
                    if '{' in line:
                        started = True
                
                if started:
                    depth += line.count('{')
                    depth -= line.count('}')
                    
                    # Wenn Tiefe 0 ist und wir mindestens eine Öffnung hatten, ist die Funktion zu Ende
                    if depth == 0 and started:
                        length = j - start_line_idx + 1
                        print(f"{func_name:<30} | {length:>4} lines")
                        i = j + 1 # Springen zur nächsten Zeile nach der Funktion
                        break
            
            else:
                # Wenn die Schleife normal endet (break nicht ausgelöst), bedeutet das, 
                # dass keine schließende Klammer gefunden wurde.
                print(f"{func_name:<30} | {'ERROR (no closing brace)':>25}")
                i += 1

if __name__ == "__main__":
    # Wenn Argumente übergeben wurden, verwende diese
    if len(sys.argv) > 1:
        files = [Path(arg) for arg in sys.argv[1:]]
    else:
        # Standard-Verhalten, falls keine Argumente gegeben sind (optional)
        print("Keine Dateien angegeben. Suche in scripts/...")
        files = list(Path("scripts").glob("*.js"))

    analyze_functions(files)
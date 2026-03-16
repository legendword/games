
n = 7

p = open("out.txt", "w")

p.write('[')

with open("dictionary.txt", "r") as f:
    word = f.readline().strip()
    while word:
        if len(word) == n:
            p.write('"' + word + '", ')
        word = f.readline().strip()

p.write(']')

p.close()
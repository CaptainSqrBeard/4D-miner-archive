# Clears all entities from a world
import os
import re
import shutil
import json
import math

world_dir = input("Enter world directory:").replace("\"","")
localized = input("Cull local to a chunk? (Y/N)").lower() == "y"

x = 0
z = 0
w = 0

if localized:
    use_player = input("Cull local to player? (Y/N)").lower() == "y"
    if use_player:
        player_file = open(world_dir+"/players.json")
        player_dat = json.loads(player_file.read())['']
        player_file.close()
        pos = player_dat['position']
        x = math.floor(pos['x']/8)
        z = math.floor(pos['z']/8)
        w = math.floor(pos['w']/8)
    else:
        x = int(input("\tX: "))
        z = int(input("\tZ: "))
        w = int(input("\tW: "))

world_dir += '/chunks/'

print("Using chunk position (X:{} Z:{} W:{})".format(x,z,w))
origin = (x,z,w)

distance = int(input("Enter cull distance (This distance and onwards): "))

def getChunkPos(name):
    cord = re.split('[xzw]',name)
    return (int(cord[1]), int(cord[2]), int(cord[3]))

def shouldCullChunk(pos,origin,dist):
    for i in range(3):
        p1 = pos[i]
        p2 = origin[i]
        if abs(p1-p2) >= dist:
            return True
    return False

culled = 0

for chunk in os.listdir(world_dir):
    pos = getChunkPos(chunk)
    cull = shouldCullChunk(pos,origin,distance)
    if cull:
        path = world_dir+chunk
        if os.path.exists(path):
            shutil.rmtree(path)
            culled = culled + 1

print("Successfully culled {} chunks.".format(culled))
    

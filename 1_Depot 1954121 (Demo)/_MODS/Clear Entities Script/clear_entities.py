# Clears all entities from a world
import os
import shutil
import json

world_dir = input("Enter world directory:").replace("\"","") 

world_dir = world_dir + "/chunks/"

deleted = 0
culled = 0

def cleanNonChestEnts(data):
    global deleted
    edited = False
    for i in range(len(data)-1,-1,-1):
        entity = data[i]
        if entity['name'] != 'Chest':
            del data[i]
            deleted += 1
            edited = True
    return edited, data

for chunk in os.listdir(world_dir):
    path = world_dir+chunk
    if not os.path.exists(path+"/blocks.bin"):
        shutil.rmtree(path)
        culled += 1
    else:
        file_obj = open(path+"/entities.json","r")
        file_str = file_obj.read()
        file_obj.close()
        if file_str != "[]":
            try:
                data = json.loads(file_str)
                edited, data = cleanNonChestEnts(data)
                if edited:
                    file_obj = open(path+"/entities.json","w")
                    file_obj.write(json.dumps(data))
                    file_obj.close()
            except:
                print("Error in entity file! {}".format(chunk))
            
            
        

print("""World wiped of entities...
\tDeleted {} entities
\tCulled {} chunks
""".format(deleted,culled))

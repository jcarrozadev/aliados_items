fx_version 'cerulean'
game 'gta5'

name 'aliados-items'
author 'grofer'
description 'Tablet de consulta de items para admins/god'
version '1.0.0'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/script.js',
    'html/style.css'
}

-- Asegura que la tabla de items esté disponible
shared_scripts {
    '@qb-core/shared/items.lua'
}

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

dependencies {
    'qb-core',
    'qb-inventory'
}

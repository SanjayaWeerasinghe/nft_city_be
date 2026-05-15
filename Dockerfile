# FROM node:22

# ENV USER=nodejs
# ENV USERID=6100
# ENV GROUP=nodejs
# ENV GROUPID=6100

# # Create app directory
# WORKDIR /home/$USER/app

# # Add local user for security
# RUN groupadd -g $GROUPID $GROUP
# RUN useradd -g $GROUPID -l -m -s /bin/false -u $USERID $USER
# RUN chown -R $USER:$GROUP /home/$USER

# # Create uploads directories with proper permissions BEFORE switching user
# RUN mkdir -p /home/$USER/app/uploads/challan && \
#     mkdir -p /home/$USER/app/uploads/id && \
#     chown -R $USER:$GROUP /home/$USER/app/uploads && \
#     chmod -R 755 /home/$USER/app/uploads

# USER $USER

# # Copy package.json
# COPY package.json .
# RUN npm install --production --quiet

# # Bundle app source
# COPY . .

# # Start Node server
# CMD ["npm", "start"]


FROM node:22

# Create non-root user
ARG USER=nodeapp
ARG UID=6100
ARG GID=6100

RUN groupadd -g $GID $USER \
    && useradd -m -u $UID -g $GID -s /bin/bash $USER

WORKDIR /home/$USER/app

# Copy package.json first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --quiet

# Copy your source code
COPY . .

# Fix permissions
RUN chown -R $USER:$USER /home/$USER/app

USER $USER

# Expose your app port
EXPOSE 2700

# Start the server
CMD ["npm", "start"]

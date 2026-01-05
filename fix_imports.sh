#!/bin/bash

# Fix Routes (imports of controllers)
# Pattern: from '../controllers/X.controller' -> from '../controllers/GROUP/X.controller'

# Auth
sed -i '' "s|controllers/auth.controller|controllers/auth/auth.controller|g" src/routes/*.ts

# Training
sed -i '' "s|controllers/trainingPlan.controller|controllers/training/trainingPlan.controller|g" src/routes/*.ts
sed -i '' "s|controllers/workoutPlan.controller|controllers/training/workoutPlan.controller|g" src/routes/*.ts
sed -i '' "s|controllers/nutritionPlan.controller|controllers/training/nutritionPlan.controller|g" src/routes/*.ts

# Users
sed -i '' "s|controllers/user.controller|controllers/users/user.controller|g" src/routes/*.ts
sed -i '' "s|controllers/client.controller|controllers/users/client.controller|g" src/routes/*.ts
sed -i '' "s|controllers/trainer.controller|controllers/users/trainer.controller|g" src/routes/*.ts
sed -i '' "s|controllers/trainerRelation.controller|controllers/users/trainerRelation.controller|g" src/routes/*.ts
sed -i '' "s|controllers/trainerChangeRequest.controller|controllers/users/trainerChangeRequest.controller|g" src/routes/*.ts

# Core
sed -i '' "s|controllers/payment.controller|controllers/core/payment.controller|g" src/routes/*.ts
sed -i '' "s|controllers/message.controller|controllers/core/message.controller|g" src/routes/*.ts
sed -i '' "s|controllers/review.controller|controllers/core/review.controller|g" src/routes/*.ts
sed -i '' "s|controllers/session.controller|controllers/core/session.controller|g" src/routes/*.ts
sed -i '' "s|controllers/progress.controller|controllers/core/progress.controller|g" src/routes/*.ts


# Fix Moved Files (Controllers & Services)
# 1. Fix depth (../ -> ../../)
# We only want to target the imports that were relative to the src root (like ../models).
# But we also have imports between services/controllers.

# Let's just do a global replace of '../' with '../../' for the moved files.
# This will break things that were NOT pointing to src root?
# Most imports in controllers/services are:
# ../models/...
# ../services/...
# ../utils/...
# ../types/...
# ../config/...
# ../middlewares/...

# So replacing '../' with '../../' is generally correct for these.

find src/controllers -name "*.ts" -exec sed -i '' "s|from '\.\./|from '../../|g" {} +
find src/services -name "*.ts" -exec sed -i '' "s|from '\.\./|from '../../|g" {} +

# 2. Fix Service paths in Controllers (and other services)
# Now they look like '../../services/auth.service'.
# We need them to be '../../services/auth/auth.service'.

FILES=$(find src/controllers src/services -name "*.ts")

# Auth
sed -i '' "s|services/auth.service|services/auth/auth.service|g" $FILES

# Training
sed -i '' "s|services/trainingPlan.service|services/training/trainingPlan.service|g" $FILES
sed -i '' "s|services/workoutPlan.service|services/training/workoutPlan.service|g" $FILES
sed -i '' "s|services/nutritionPlan.service|services/training/nutritionPlan.service|g" $FILES
sed -i '' "s|services/exercise.service|services/training/exercise.service|g" $FILES
sed -i '' "s|services/workout.service|services/training/workout.service|g" $FILES
sed -i '' "s|services/workoutFeedback.service|services/training/workoutFeedback.service|g" $FILES
sed -i '' "s|services/workoutProgress.service|services/training/workoutProgress.service|g" $FILES

# Users
sed -i '' "s|services/user.service|services/users/user.service|g" $FILES
sed -i '' "s|services/client.service|services/users/client.service|g" $FILES
sed -i '' "s|services/trainer.service|services/users/trainer.service|g" $FILES
sed -i '' "s|services/trainerRelation.service|services/users/trainerRelation.service|g" $FILES
sed -i '' "s|services/trainerChangeRequest.service|services/users/trainerChangeRequest.service|g" $FILES

# Core
sed -i '' "s|services/payment.service|services/core/payment.service|g" $FILES
sed -i '' "s|services/message.service|services/core/message.service|g" $FILES
sed -i '' "s|services/review.service|services/core/review.service|g" $FILES
sed -i '' "s|services/session.service|services/core/session.service|g" $FILES
sed -i '' "s|services/progress.service|services/core/progress.service|g" $FILES
